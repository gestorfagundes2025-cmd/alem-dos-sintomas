"""Generate lightweight WebP variants used by the Saúde Shalon landing page."""
from pathlib import Path
from PIL import Image, ImageOps

ROOT=Path(__file__).resolve().parents[1]
ASSETS=ROOT/"public"/"assets"
TASKS={
    "atividade-profissional.jpg":("atividade-profissional.webp",1600,80),
    "avaliacao.jpg":("avaliacao.webp",1400,80),
    "exame-cell.jpg":("exame-cell.webp",1200,80),
    "clinica-recepcao.jpg":("clinica-recepcao.webp",1600,78),
    "clinica-espera.jpg":("clinica-espera.webp",1200,78),
    "clinica-corredor.jpg":("clinica-corredor.webp",1200,78),
    "dra-elizete-mentora.jpg":("dra-elizete-mentora.webp",1600,80),
    "dra-elizete-mentora-mobile.jpg":("dra-elizete-mentora-mobile.webp",1200,78),
}
for source_name,(dest_name,max_side,quality) in TASKS.items():
    source=ASSETS/source_name
    if not source.exists():
        raise SystemExit(f"Missing source image: {source}")
    dest=ASSETS/dest_name
    with Image.open(source) as im:
        im=ImageOps.exif_transpose(im).convert("RGB")
        im.thumbnail((max_side,max_side),Image.Resampling.LANCZOS)
        im.save(dest,"WEBP",quality=quality,method=6,icc_profile=None,exif=b"")
        print(f"{dest.name}: {im.width}x{im.height} · {dest.stat().st_size} bytes")
