#!/usr/bin/env python3
import math
import os
import struct
import zlib


ICON_SIZES = (16, 32, 48, 128)
SCALE = 4


def blend_pixel(pixel, color):
    sr, sg, sb, sa = color
    if sa == 255:
      return [sr, sg, sb, 255]

    dr, dg, db, da = pixel
    alpha = sa / 255
    out_alpha = alpha + (da / 255) * (1 - alpha)
    if out_alpha == 0:
        return [0, 0, 0, 0]

    return [
        round((sr * alpha + dr * (da / 255) * (1 - alpha)) / out_alpha),
        round((sg * alpha + dg * (da / 255) * (1 - alpha)) / out_alpha),
        round((sb * alpha + db * (da / 255) * (1 - alpha)) / out_alpha),
        round(out_alpha * 255),
    ]


def in_rounded_rect(x, y, size, radius):
    if radius <= x < size - radius or radius <= y < size - radius:
        return True

    cx = radius if x < radius else size - radius - 1
    cy = radius if y < radius else size - radius - 1
    return (x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2


def draw_rounded_rect(canvas, size, inset, radius, color):
    for y in range(inset, size - inset):
        for x in range(inset, size - inset):
            if in_rounded_rect(x - inset, y - inset, size - inset * 2, radius):
                canvas[y][x] = blend_pixel(canvas[y][x], color)


def draw_ring(canvas, size, cx, cy, radius, thickness, color):
    inner = radius - thickness / 2
    outer = radius + thickness / 2
    for y in range(size):
        for x in range(size):
            distance = math.hypot(x - cx, y - cy)
            if inner <= distance <= outer:
                canvas[y][x] = blend_pixel(canvas[y][x], color)


def draw_line(canvas, size, x1, y1, x2, y2, thickness, color):
    length = max(1, math.hypot(x2 - x1, y2 - y1))
    steps = int(length * 2)
    radius = thickness / 2

    for step in range(steps + 1):
        t = step / steps
        cx = x1 + (x2 - x1) * t
        cy = y1 + (y2 - y1) * t
        left = max(0, int(cx - radius - 1))
        right = min(size - 1, int(cx + radius + 1))
        top = max(0, int(cy - radius - 1))
        bottom = min(size - 1, int(cy + radius + 1))

        for y in range(top, bottom + 1):
            for x in range(left, right + 1):
                if math.hypot(x - cx, y - cy) <= radius:
                    canvas[y][x] = blend_pixel(canvas[y][x], color)


def downsample(canvas, size):
    source_size = size * SCALE
    pixels = []

    for y in range(size):
        row = []
        for x in range(size):
            totals = [0, 0, 0, 0]
            for sy in range(y * SCALE, (y + 1) * SCALE):
                for sx in range(x * SCALE, (x + 1) * SCALE):
                    pixel = canvas[sy][sx]
                    totals[0] += pixel[0]
                    totals[1] += pixel[1]
                    totals[2] += pixel[2]
                    totals[3] += pixel[3]
            count = SCALE * SCALE
            row.append(bytes(round(value / count) for value in totals))
        pixels.append(row)

    return pixels


def png_chunk(kind, data):
    return (
        struct.pack(">I", len(data))
        + kind
        + data
        + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF)
    )


def write_png(path, rows, size):
    raw = b"".join(b"\x00" + b"".join(row) for row in rows)
    data = b"\x89PNG\r\n\x1a\n"
    data += png_chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0))
    data += png_chunk(b"IDAT", zlib.compress(raw, 9))
    data += png_chunk(b"IEND", b"")

    with open(path, "wb") as file:
        file.write(data)


def render_icon(size):
    source_size = size * SCALE
    canvas = [[[0, 0, 0, 0] for _ in range(source_size)] for _ in range(source_size)]
    inset = max(2 * SCALE, round(source_size * 0.08))
    radius = round(source_size * 0.22)

    draw_rounded_rect(canvas, source_size, inset, radius, [6, 95, 212, 255])
    draw_ring(
        canvas,
        source_size,
        source_size * 0.44,
        source_size * 0.42,
        source_size * 0.16,
        max(2, source_size * 0.055),
        [255, 255, 255, 255],
    )
    draw_line(
        canvas,
        source_size,
        source_size * 0.55,
        source_size * 0.55,
        source_size * 0.70,
        source_size * 0.70,
        max(2, source_size * 0.07),
        [255, 255, 255, 255],
    )

    return downsample(canvas, size)


def main():
    os.makedirs("icons", exist_ok=True)

    for size in ICON_SIZES:
        rows = render_icon(size)
        write_png(f"icons/icon-{size}.png", rows, size)


if __name__ == "__main__":
    main()
