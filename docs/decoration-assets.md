# Registration decoration cutouts

Created with the built-in image editing tool from the user's uploaded images. The imagegen skill guided transparent-background extraction. The existing group photo was not edited; its display now preserves the original aspect ratio, with the caption underneath.

Final project assets:

- `client/public/images/freshers/silver-star.png`
- `client/public/images/freshers/silver-streamers.png`

## Star prompt

Use case: background-extraction. Edit target: the supplied silver chrome star balloon image. Remove ONLY the checkerboard background and make it truly transparent (alpha). Preserve the exact single five-point silver star silhouette, inflated shape, chrome reflections, seams, shading, orientation and framing. No added objects, text, string, glow or shadows outside the star. This is a clean cutout for a dark website. Do not render a checkerboard or white background.

## Streamers prompt

Use case: background-extraction. Edit target: supplied silver curled streamers and confetti image. Remove ONLY the white background, making it truly transparent (alpha), including gaps between curls. Preserve all five hanging silver spiral ribbons, their lengths, curls, metallic silver/charcoal highlights and shadows, positions and small confetti pieces. Keep the original composition with ribbon tops entering from the upper edge. No new objects or text. Preserve white metallic highlights on the ribbons while removing the background. Clean cutout for use on a dark purple website.

## Streamers cleanup prompt

Background-extraction repair. Keep these five silver metallic curled hanging ribbon streamers and their small discrete confetti pieces exactly as shown, unchanged shape, order, detail and appearance. REMOVE ALL residual white cloud-like mottled noise/speckled patches in the gaps outside the ribbon objects. These are leftover background, not confetti. The entire negative space between and outside the five ribbons must be completely transparent alpha zero. Absolutely no white haze, checkerboard, flecks of background, background texture, or halo. Keep solid white specular highlights ON the actual ribbon surfaces. Clean, sharply cut out five ribbons and separate square confetti pieces only, over transparent background. No added objects.
