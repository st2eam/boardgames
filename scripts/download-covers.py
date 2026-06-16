#!/usr/bin/env python3
"""Download board game cover images from BGG CDN."""
import os, ssl, urllib.request, time

ssl._create_default_https_context = ssl._create_unverified_context

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "images", "games")
os.makedirs(OUT, exist_ok=True)

URLS = {
    "texas-holdem": "https://cf.geekdo-images.com/me9p1hMz5F0WEuY0uJCZ_Q__imagepage/img/7gTMGzU5WGXa1tcF-Avj27TeKbc=/fit-in/900x600/filters:no_upscale():strip_icc()/pic1164502.jpg",
    "tacta": "https://cf.geekdo-images.com/yJpVLQv5HdzV-0i5F3dF5g__imagepage/img/RzIev1V5tx-mQ3pOhABUp4CwOPQ=/fit-in/900x600/filters:no_upscale():strip_icc()/pic8758068.jpg",
    "dirty-pig": "https://cf.geekdo-images.com/TOddi3WhObt77hb63vseDg__medium/img/7ixNX2FY3cMBqR5Ry6CKYzPLjGI=/fit-in/500x500/filters:no_upscale():strip_icc()/pic4598767.jpg",
    "catan": "https://cf.geekdo-images.com/B323kVkbkMPC0ymHhTMSKg__imagepage/img/GEbr3JMFmAW8kJpTnAUj_pCDyac=/fit-in/900x600/filters:no_upscale():strip_icc()/pic7953266.jpg",
    "carcassonne": "https://cf.geekdo-images.com/gIc4etVRc3Hc3lMTlcXzMQ__imagepage/img/iyahKE1jhGUZ8bxHCzxGfKTNqsI=/fit-in/900x600/filters:no_upscale():strip_icc()/pic8158904.jpg",
    "sea-salt-origami": "https://cf.geekdo-images.com/CIh_rXKoRw9z8K0PJxT8nQ__imagepage/img/c1ZBBdIh3xOH6Iw_obvX761h76s=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6973911.jpg",
    "sanguosha": "https://cf.geekdo-images.com/8em1q4Px507d8yeI8vzEWQ__imagepage/img/2rozEaR-NDWr120s7bUD0fFY-UQ=/fit-in/900x600/filters:no_upscale():strip_icc()/pic309488.jpg",
    "modern-art": "https://cf.geekdo-images.com/wLto-xaabHwKQe_Bc4iD1Q__imagepage/img/zLttqNoD_8ukBx9b2boUAHWTMec=/fit-in/900x600/filters:no_upscale():strip_icc()/pic3458036.png",
    "uno": "https://cf.geekdo-images.com/c_1twbUEvrd3W8z6hIdWAQ__imagepage/img/9gBuO2iq3XrxkZsGhk4Ub8gofh4=/fit-in/900x600/filters:no_upscale():strip_icc()/pic7938450.jpg",
    "uno-flip": "https://cf.geekdo-images.com/f5dr51EcDcqLTgOIdWpBcA__imagepage/img/cjSXOnMAQ72_kZKMqWS92LlvWfw=/fit-in/900x600/filters:no_upscale():strip_icc()/pic7938374.jpg",
    "uno-no-mercy": "https://cf.geekdo-images.com/BrmN9uBYLBf9qzlqtQUhTg__imagepage/img/Pv-rzf9S-N-yzqNfQy4Dk_hjhuA=/fit-in/900x600/filters:no_upscale():strip_icc()/pic7762353.jpg",
    "wind-sound-again": "https://cf.geekdo-images.com/j1hjVYLTRO-1fkeiTgAvdQ__imagepage/img/8TT9Te9paNb8JHbuTTPwq9GqEss=/fit-in/900x600/filters:no_upscale():strip_icc()/pic7088760.jpg",
    "cabo": "https://cf.geekdo-images.com/xm0CoWYr8kO0EaqlaVdVWQ__imagepage/img/0ENyoUVcQL3lZUk8cKwMcJVbzGM=/fit-in/900x600/filters:no_upscale():strip_icc()/pic754318.jpg",
    "exploding-kittens": "https://cf.geekdo-images.com/N8bL53-pRU7zaXDTrEaYrw__imagepage/img/qdivOjtkEd8Jma35bdI3mOwaoZg=/fit-in/900x600/filters:no_upscale():strip_icc()/pic2691976.png",
    "exploding-kittens-black": "https://cf.geekdo-images.com/q1fHQMYtU-aajQKTYDlx7w__imagepage/img/9FE2tdrwFQo2tYzjtXXSRkoBE9w=/fit-in/900x600/filters:no_upscale():strip_icc()/pic2815278.jpg",
    "splendor": "https://cf.geekdo-images.com/rwOMxx4q5yuElIvo-1-OFw__imagepage/img/GJsJkVpVmrRj6Oy8SiIUU8h_rmo=/fit-in/900x600/filters:no_upscale():strip_icc()/pic1904079.jpg",
    "splendor-pokemon": "https://cf.geekdo-images.com/o6HpiLCBBFvc7XvBv7DEig__imagepage/img/av2e9XjgvG0JOyc-9bSbU_t4bog=/fit-in/900x600/filters:no_upscale():strip_icc()/pic7902371.jpg",
}

total = len(URLS)
ok = 0
for i, (slug, url) in enumerate(URLS.items(), 1):
    ext = "png" if url.endswith(".png") else "jpg"
    outfile = os.path.join(OUT, f"{slug}.webp")
    tmpfile = os.path.join(OUT, f"{slug}.{ext}")
    if os.path.exists(outfile) and os.path.getsize(outfile) > 5000:
        print(f"[{i}/{total}] Skip {slug} (exists)")
        ok += 1
        continue
    print(f"[{i}/{total}] Downloading {slug}...")
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = resp.read()
        if len(data) > 5000:
            with open(tmpfile, "wb") as f:
                f.write(data)
            os.rename(tmpfile, outfile)
            print(f"  -> OK ({len(data):,} bytes)")
            ok += 1
        else:
            print(f"  -> TOO SMALL ({len(data)} bytes)")
    except Exception as e:
        print(f"  -> FAILED: {e}")
    time.sleep(0.5)

print(f"\nDone! {ok}/{total} images downloaded to {OUT}")
for f in sorted(os.listdir(OUT)):
    if f.startswith("."): continue
    size = os.path.getsize(os.path.join(OUT, f))
    print(f"  {f}: {size:,} bytes")
