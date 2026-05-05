# Art Prompts

This file captures stable prompt rules for generating `Darkfront: Last Stand` unit sprites and UI assets.

## Unit Sprite Rules

Use these rules for generated unit sprites unless a direct request says otherwise:

- cute dark fantasy mobile auto battler unit sprite
- 2D cartoon / vector-like render
- thick black or very dark navy outer outline
- rounded chunky shapes
- readable silhouette at small mobile size
- bright saturated accent colors over darker fantasy base colors
- soft gradients and small white highlights
- subtle contact shadow is OK
- neutral medium gray background for easier manual cutout
- single full-body character centered in the image
- no text, no UI frame, no extra props floating separately unless they belong to the unit

Preferred background wording:

```text
on a flat neutral medium gray background for easy cutout, no scene, no floor, no frame
```

Preferred outline wording:

```text
thick black outer outline, clean dark inner linework
```

## Unit Prompt Template

```text
Create a dark fantasy cute mobile auto battler unit sprite: [UNIT NAME], [short visual description], [pose/personality], [key colors and readable features].

Style: 2D cartoon mobile game sprite, thick black outer outline, clean dark inner linework, rounded chunky shapes, bright saturated accents, soft gradients, white highlights, subtle contact shadow, sticker-like fantasy game asset, clean silhouette, simple readable details, full-body character centered, on a flat neutral medium gray background for easy cutout, no scene, no floor, no frame, no text.
```

## Notes

- Generate separate units as separate images when clean cutout and consistent scale matter.
- If generating summons or evolved forms, keep them visually related through eye color, accent color, and silhouette language.
- Do not use painterly realism; keep the result closer to clean mobile game sprites.
