# India Pulse Map - SVG Path Setup

## Getting an Accurate India SVG Path

### Option 1: Wikimedia Commons (Recommended - Fastest)

1. Go to https://commons.wikimedia.org/wiki/Category:SVG_maps_of_India
2. Find a simple India outline SVG (e.g., "India location map" or "India blank map")
3. Click on the file → "View file" → "Download"
4. Open the SVG in a text editor
5. Find the `<path d="..."/>` element
6. Copy the `d` attribute value
7. Paste it into `IndiaMapSVG.tsx` as the `accurateIndiaPath` variable

### Option 2: Natural Earth (Most Accurate - Public Domain)

1. Go to https://www.naturalearthdata.com/downloads/
2. Download "Admin 0 – Countries" at 1:10m or 1:50m scale
3. Extract India's shapefile
4. Use Mapshaper to convert to SVG:
   ```bash
   npm install -g mapshaper
   mapshaper india.shp -simplify 5% -o format=svg india.svg
   ```
5. Open the SVG and extract the path `d` attribute
6. Paste into `IndiaMapSVG.tsx`

### Option 3: Use react-simple-maps (Runtime Solution)

If you want automatic projection handling:

1. Install: `npm install react-simple-maps`
2. Download India TopoJSON from Natural Earth
3. Place in `public/data/india.topo.json`
4. Use the `ComposableMap` component (see example in user's instructions)

## Current Implementation

The current `IndiaMapSVG.tsx` uses a simplified path. Replace the `accurateIndiaPath` variable with your accurate path from one of the sources above.

## Pulse Coordinates

The pulse coordinates in `IndiaPulseMap.tsx` are based on percentage positioning relative to the SVG viewBox. If you change the viewBox, you may need to adjust the pulse coordinates.

### Current ViewBox: `0 0 1000 1200`
- Width: 1000 units (represents ~30° longitude: 68°E to 98°E)
- Height: 1200 units (represents ~31° latitude: 6°N to 37°N)

### City Coordinates (approximate percentages)
- Delhi NCR: ~77°E, ~29°N → x: 65%, y: 27%
- Mumbai: ~73°E, ~19°N → x: 34%, y: 47%
- Bengaluru: ~78°E, ~13°N → x: 50%, y: 72%
- Hyderabad: ~78°E, ~17°N → x: 48%, y: 63%
- Chennai: ~80°E, ~13°N → x: 52%, y: 81%
- Kolkata: ~88°E, ~23°N → x: 76%, y: 58%
- Pune: ~74°E, ~19°N → x: 38%, y: 52%
- Ahmedabad: ~73°E, ~23°N → x: 46%, y: 34%
- Jaipur: ~76°E, ~27°N → x: 58%, y: 33%
- Indore: ~76°E, ~23°N → x: 52%, y: 39%
- Coimbatore: ~77°E, ~11°N → x: 42%, y: 74%
- Kerala: ~76°E, ~10°N → x: 30%, y: 69%

## Testing

After replacing the path:
1. Check that the map displays correctly
2. Verify pulse dots align with cities
3. Test the stroke animation
4. Ensure the viewBox matches your path's bounding box

