# TODO: Transformar DetalleCarta.jsx

## UI/UX Improvements
- [x] Update container max-width to 1200px, centered
- [x] Enhance image styling (premium look with box-shadow, border-radius)
- [x] Improve typography: larger bold title, prominent price (2rem, brand color), stock badges (green/red)
- [x] Redesign details section with grid/flex and icons
- [x] Improve description (line-height, gray color)
- [x] Style CTA button: full width mobile, wide desktop, increased padding, hover effects

## Related Products Section
- [x] Add relatedProducts state
- [x] Add useEffect to fetch all products and filter related ones (by game/category, exclude current, limit 4)
- [x] Render related products section below main product using CardPreview/ProductPreview
- [x] Ensure images use getImageBySlug if needed

## CSS Updates
- [x] Add styles for badges, grid layout, improved elements in detalle-carta.css

## Testing
- [ ] Test fetching and rendering
- [ ] Ensure responsiveness
