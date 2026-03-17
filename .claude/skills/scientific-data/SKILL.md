---
name: scientific-data
description: Extended patterns for acquiring data from scientific databases across specific research domains — genomics/bioinformatics, climate science, astronomy, social science, and public health. Use when the researcher agent needs domain-specific download tools, specialized file formats, or database-specific query syntax. Also use when a dataset requires NCBI SRA tools, netCDF handling, FITS files, or other domain-specific formats that WebFetch alone can't handle. Triggers on mentions of specific databases (GEO, SRA, ERA5, SDSS, IPUMS, NHANES) or file formats (FASTQ, netCDF, FITS, HDF5, Parquet).
---

# Scientific Data Acquisition — Domain Patterns

This skill covers domain-specific acquisition patterns for scientific databases. The researcher agent's main file covers the general tier system (open / API-key / manual). Load this skill when the database or file format is domain-specific enough to need specialized tooling.

## Table of Contents

1. [Genomics & Bioinformatics](#genomics--bioinformatics)
2. [Climate & Atmospheric Science](#climate--atmospheric-science)
3. [Astronomy & Astrophysics](#astronomy--astrophysics)
4. [Social Science & Economics](#social-science--economics)
5. [Public Health & Clinical Data](#public-health--clinical-data)
6. [Domain-Specific File Formats](#domain-specific-file-formats)
7. [Large Dataset Strategy](#large-dataset-strategy)

---

## Genomics & Bioinformatics

### NCBI SRA (Sequence Read Archive)

Requires `sra-tools`. Check if installed:

```bash
which fasterq-dump || pip install sra-tools 2>/dev/null || echo "Install sra-tools: https://github.com/ncbi/sra-tools/wiki/02.-Installing-SRA-Toolkit"
```

```bash
# Download a specific SRA accession (e.g., SRR123456)
# This downloads the raw FASTQ reads
fasterq-dump SRR123456 --outdir data/sra/ --progress

# For paired-end reads (most modern sequencing)
fasterq-dump SRR123456 --outdir data/sra/ --split-files --progress

# Check file size before downloading (SRA files can be very large)
sra-stat --quick SRR123456
```

**Note:** SRA downloads can be 10–100+ GB. Always check size with `sra-stat` first and confirm with the human.

### NCBI GEO (Gene Expression Omnibus)

GEO data is generally open but uses custom download formats:

```bash
# Download a GEO series (e.g., GSE12345)
# Series matrix files are the processed, analysis-ready format
curl -O "https://ftp.ncbi.nlm.nih.gov/geo/series/GSE12nnn/GSE12345/matrix/GSE12345_series_matrix.txt.gz"
gunzip GSE12345_series_matrix.txt.gz

# Supplementary files (raw data, processed counts)
# List available files first
curl "https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE12345&form=text" | grep "Supplementary file"
```

### Ensembl (Reference Genomes & Annotations)

```bash
# Download reference genome FASTA (human GRCh38)
curl -O "https://ftp.ensembl.org/pub/release-111/fasta/homo_sapiens/dna/Homo_sapiens.GRCh38.dna.primary_assembly.fa.gz"

# Download gene annotations GTF
curl -O "https://ftp.ensembl.org/pub/release-111/gtf/homo_sapiens/Homo_sapiens.GRCh38.111.gtf.gz"
```

**Note:** Reference genomes are 3–15 GB compressed. Confirm before downloading.

### UniProt (Protein Data)

```bash
# Search and download protein sequences
# REST API, no auth needed
curl "https://rest.uniprot.org/uniprotkb/search?query=gene:BRCA1+AND+organism_id:9606&format=fasta" \
  -o data/brca1_human.fasta

# Download by accession list
curl "https://rest.uniprot.org/uniprotkb/accessions?accessions=P38398,P51587&format=tsv" \
  -o data/proteins.tsv
```

---

## Climate & Atmospheric Science

### ERA5 (ECMWF Reanalysis) — Requires CDS API key

ERA5 is the gold standard for historical climate data but requires registration.

```bash
# Install CDS API client
pip install cdsapi

# Requires ~/.cdsapirc with:
# url: https://cds.climate.copernicus.eu/api
# key: <UID>:<API_KEY>
# (API key from https://cds.climate.copernicus.eu/profile)

# Download via Python script (write to data/download_era5.py)
python3 - <<'EOF'
import cdsapi
c = cdsapi.Client()
c.retrieve(
    'reanalysis-era5-single-levels',
    {
        'product_type': 'reanalysis',
        'variable': ['2m_temperature', 'total_precipitation'],
        'year': '2023',
        'month': ['01', '06', '12'],
        'day': [f'{d:02d}' for d in range(1, 32)],
        'time': ['00:00', '12:00'],
        'format': 'netcdf',
    },
    'data/era5_sample.nc'
)
EOF
```

**Note:** ERA5 downloads queue on the CDS servers and may take minutes to hours. The API will poll automatically.

### NOAA Climate Data (Open — no key needed)

```bash
# NOAA Global Surface Summary of Day (GSOD)
# Station data by year
curl -O "https://www.ncei.noaa.gov/data/global-summary-of-the-day/access/2023/72429014733.csv"

# NOAA GHCN Daily (weather station observations)
curl "https://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GHCND&stationid=GHCND:USW00094728&startdate=2023-01-01&enddate=2023-12-31&limit=1000" \
  -H "token: $NOAA_CDO_TOKEN" \
  -o data/noaa_daily.json
# Note: CDO API token is free: https://www.ncdc.noaa.gov/cdo-web/token
```

### NASA GISS Surface Temperature (GISTEMP)

```bash
# Fully open, no auth
curl -O "https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv"
```

---

## Astronomy & Astrophysics

### SDSS (Sloan Digital Sky Survey)

```bash
# SQL query via SDSS SkyServer (no auth needed)
curl "https://skyserver.sdss.org/dr18/SkyServerWS/SearchTools/SqlSearch?cmd=SELECT+TOP+100+ra,dec,u,g,r,i,z+FROM+PhotoObj+WHERE+r+BETWEEN+14+AND+15&format=csv" \
  -o data/sdss_sample.csv

# CasJobs for larger queries: register at skyserver.sdss.org/casjobs/
```

### NASA ADS (Astrophysics Data System)

```bash
# Requires ADS API token (free): ads.harvard.edu/help/api/
curl -H "Authorization: Bearer $ADS_TOKEN" \
  "https://api.adsabs.harvard.edu/v1/search/query?q=author:Einstein&fl=title,author,year,bibcode&rows=50" \
  -o data/ads_results.json
```

### FITS Files (Flexible Image Transport System)

FITS is the standard format for astronomical imaging and spectral data. `WebFetch` cannot parse it meaningfully — need Python:

```bash
pip install astropy

python3 - <<'EOF'
from astropy.io import fits
import numpy as np

hdul = fits.open('data/observation.fits')
hdul.info()  # print structure
data = hdul[0].data  # primary HDU data
header = hdul[0].header
print(f"Shape: {data.shape}, dtype: {data.dtype}")
print(f"OBJECT: {header.get('OBJECT', 'unknown')}")
EOF
```

---

## Social Science & Economics

### IPUMS (Census & Survey Microdata) — Requires registration

IPUMS provides harmonized census data but requires a free account and data use agreement. This is Tier 3 — human must request and download.

- Registration: ipums.org
- Users select variables, submit an extract request, receive a download link
- Data comes as fixed-width `.dat` + `.xml` codebook, or `.csv`

Emit `<credential_request tier="MANUAL_DOWNLOAD">` with the link to ipums.org.

### World Bank Open Data (Open)

```bash
# World Bank API — no auth
curl "https://api.worldbank.org/v2/country/US;GB;DE/indicator/NY.GDP.PCAP.CD?format=json&per_page=100&date=2000:2023" \
  -o data/gdp_per_capita.json
```

### FRED (Federal Reserve Economic Data) — API key optional but free

```bash
# Free API key from fred.stlouisfed.org/docs/api/api_key.html
curl "https://api.stlouisfed.org/fred/series/observations?series_id=UNRATE&api_key=$FRED_API_KEY&file_type=json&observation_start=2000-01-01" \
  -o data/unemployment.json

# Without API key: 120 requests/min limit still works for small tasks
curl "https://api.stlouisfed.org/fred/series/observations?series_id=UNRATE&api_key=abcdefghijklmnopqrstuvwxyz123456&file_type=json" \
  -o data/unemployment.json
# Note: the public "sandbox" key is rate-limited; get a real key for production
```

---

## Public Health & Clinical Data

### CDC WONDER (Open — no auth)

CDC WONDER provides mortality, natality, and cancer statistics via a web form. Direct API access requires form POST — simpler to use the pre-built data files:

```bash
# CDC WISQARS injury data, pre-built files
curl -O "https://wisqars.cdc.gov/data/downloads/intent.csv"

# CDC BRFSS (Behavioral Risk Factor Surveillance)
curl -O "https://www.cdc.gov/brfss/annual_data/2022/files/LLCP2022XPT.zip"
unzip LLCP2022XPT.zip -d data/brfss/
```

### NHANES (National Health and Nutrition Examination Survey) — Open

```bash
# NHANES data files are public SAS transport (.XPT) format
# Download demographic + lab data for a specific cycle (e.g., 2017-2018)
curl -O "https://wwwn.cdc.gov/Nchs/Nhanes/2017-2018/DEMO_J.XPT"

# Read XPT in Python
pip install pyreadstat
python3 - <<'EOF'
import pyreadstat
df, meta = pyreadstat.read_xport('DEMO_J.XPT')
print(df.shape, df.columns.tolist()[:10])
EOF
```

### dbGaP (Controlled Access Genomic Data) — Tier 3

dbGaP contains individual-level genomic + phenotypic data for sensitive clinical studies. Access requires:
1. eRA Commons account
2. Institutional signing official (takes days to weeks)
3. Data access request approval per study

This is always Tier 3. Emit `<credential_request tier="MANUAL_DOWNLOAD">` with a note about the approval timeline.

---

## Domain-Specific File Formats

| Format | Domain | Read with |
|---|---|---|
| FASTQ / FASTA | Genomics | `biopython`, `sra-tools` |
| VCF (Variant Call Format) | Genomics | `pysam`, `cyvcf2` |
| netCDF (.nc) | Climate, oceanography | `netCDF4`, `xarray` |
| HDF5 (.h5, .hdf5) | Multi-domain | `h5py`, `pandas` |
| FITS | Astronomy | `astropy` |
| Shapefile / GeoJSON | Geospatial | `geopandas`, `fiona` |
| Parquet | ML datasets | `pandas`, `pyarrow` |
| XPT (SAS transport) | Public health | `pyreadstat` |
| DICOM | Medical imaging | `pydicom` |
| GRB / GRIB2 | Meteorology | `cfgrib`, `eccodes` |

Always check which format a dataset uses before attempting to read it. `file data/mystery_file` or `python3 -c "open('data/f','rb').read(8).hex()"` (check magic bytes) can identify unknown formats.

---

## Large Dataset Strategy

Before downloading anything over 1 GB, answer these questions:

1. **Is a sample sufficient?** Most APIs support `limit=`, `top=`, or time-range slicing. Download a 1% sample first to verify format and quality before committing to the full download.

2. **Is there a pre-processed version?** Raw genomics reads (FASTQ) are orders of magnitude larger than processed count matrices (CSV). Check if a GEO series matrix or a Zenodo processed version already exists.

3. **Does the Statistician need the raw data or derived features?** Coordinate with ST before downloading. They may only need aggregated statistics that can be computed server-side via API.

4. **Disk space check before download:**
   ```bash
   df -h .
   ```

5. **Stream instead of load where possible:**
   ```bash
   # Streaming CSV processing with pandas chunking
   python3 - <<'EOF'
   import pandas as pd
   for chunk in pd.read_csv('large_file.csv', chunksize=10000):
       print(chunk.shape)  # process in chunks
       break
   EOF
   ```
