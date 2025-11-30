# Egg Data Schema

This schema defines the data model for egg analysis. All fields are designed to be detectable by an LLM analyzing an image of an egg.

## Egg Schema

```typescript
interface EggAnalysis {
  // Visual Characteristics
  color: string;              // e.g., "white", "brown", "cream", "speckled brown", "blue-green"
  shape: string;              // e.g., "oval", "round", "elongated", "pointed", "asymmetric"
  size: string;               // e.g., "small", "medium", "large", "extra-large", "jumbo"

  // Shell Condition
  shellTexture: string;       // e.g., "smooth", "rough", "porous", "bumpy", "wrinkled", "ridged"
  shellIntegrity: string;     // e.g., "intact", "hairline crack", "cracked", "chipped", "broken"
  hardness: string;           // e.g., "hard", "normal", "soft", "thin", "rubbery"

  // Surface Details
  spotsMarkings: string;      // e.g., "none", "light speckles", "heavy speckles", "calcium deposits", "pigment spots"
  bloomCondition: string;     // e.g., "present", "partial", "absent", "washed off"
  cleanliness: string;        // e.g., "clean", "slightly dirty", "dirty", "debris attached", "stained"

  // Viability Assessment
  visibleDefects: string[];   // e.g., ["blood spot visible", "meat spot", "double yolk indicator"]
  overallGrade: string;       // e.g., "A", "B", "C", "non-viable"
  hatchLikelihood: number;    // 0-100 percent likelihood of successful hatching

  // Breed Inference (for chicken image generation)
  possibleBreeds: string[];   // e.g., ["Rhode Island Red", "Leghorn", "Ameraucana"]
  breedConfidence: string;    // e.g., "high", "medium", "low"

  // Chicken Appearance Hints (derived from egg characteristics)
  chickenAppearance: {
    plumageColor: string;     // e.g., "red-brown", "white", "black", "barred", "golden"
    combType: string;         // e.g., "single", "rose", "pea", "walnut"
    bodyType: string;         // e.g., "large/heavy", "medium", "small/bantam", "slender"
    featherPattern: string;   // e.g., "solid", "laced", "barred", "speckled", "mottled"
    legColor: string;         // e.g., "yellow", "slate", "white", "green", "black"
  };

  // LLM Notes
  notes: string;              // Free-form observations from the LLM analysis
}
```

## Field Descriptions

### Color
The primary shell color. Can include modifiers for patterns.
- Valid values: white, cream, light brown, brown, dark brown, speckled, blue, green, olive, pink

### Shape
Overall egg shape classification.
- Valid values: oval (normal), round, elongated, pointed, asymmetric, flat-sided

### Size
Relative size assessment.
- Valid values: peewee, small, medium, large, extra-large, jumbo

### Shell Texture
Surface texture of the shell.
- Valid values: smooth, slightly rough, rough, porous, bumpy, wrinkled, ridged, sandpaper-like

### Shell Integrity
Structural condition of the shell.
- Valid values: intact, hairline crack, cracked, chipped, broken, missing pieces

### Hardness
Shell hardness/thickness assessment.
- Valid values: hard, normal, slightly soft, soft, thin, paper-thin, rubbery

### Spots/Markings
Any visible spots, speckles, or deposits on the shell.
- Valid values: none, light speckles, heavy speckles, calcium deposits, pigment spots, blood spots (external)

### Bloom Condition
Status of the protective cuticle coating.
- Valid values: present (matte finish), partial, absent (shiny), washed off

### Cleanliness
How clean the egg surface is.
- Valid values: clean, slightly dirty, moderately dirty, dirty, heavily soiled, debris attached

### Visible Defects
Array of any visible defects or abnormalities.
- Examples: blood spot visible through shell, meat spot, double yolk indicator, body-checked, misshapen

### Overall Grade
Quality grade based on all factors.
- A: Excellent quality, no defects
- B: Good quality, minor imperfections
- C: Acceptable, noticeable issues
- Non-viable: Not suitable for consumption/incubation

### Hatch Likelihood
Percent likelihood (0-100) of successful hatching based on all visible factors.
- 90-100%: Excellent candidate for incubation
- 70-89%: Good candidate, minor concerns
- 50-69%: Fair candidate, some risk factors
- 25-49%: Poor candidate, significant issues
- 0-24%: Not recommended for incubation

### Possible Breeds
Array of chicken breeds that commonly lay eggs with these characteristics.
- Examples: Rhode Island Red, Leghorn, Plymouth Rock, Ameraucana, Orpington, Marans, Easter Egger, Wyandotte, Sussex, Australorp

### Breed Confidence
How confident the LLM is in the breed inference based on egg characteristics.
- Valid values: high, medium, low, uncertain

### Chicken Appearance Hints
Visual characteristics to help generate an image of the chicken that likely laid this egg.

#### Plumage Color
Primary feather coloring.
- Valid values: white, black, red-brown, golden, buff, silver, blue-gray, barred black/white, partridge

#### Comb Type
Style of comb on the chicken's head.
- Valid values: single (tall, upright), rose (flat, wide), pea (small, three ridges), walnut (bumpy), buttercup

#### Body Type
Overall body size and shape.
- Valid values: large/heavy (meat breeds), medium (dual-purpose), small/bantam, slender (egg layers)

#### Feather Pattern
Pattern of feathers.
- Valid values: solid, laced (outlined feathers), barred (stripes), speckled, mottled, penciled, columbian

#### Leg Color
Color of the chicken's legs/shanks.
- Valid values: yellow, white, slate/gray, green/willow, black, pink

## Breed-to-Egg Mapping Reference

| Egg Color | Common Breeds | Typical Chicken Appearance |
|-----------|---------------|---------------------------|
| White | Leghorn, Ancona | White/black plumage, single comb, slender |
| Brown | Rhode Island Red, Orpington | Red-brown/buff plumage, large body |
| Dark Brown | Marans, Welsummer | Black/copper plumage, feathered legs (Marans) |
| Blue/Green | Ameraucana, Easter Egger | Varied colors, pea comb, muffs/beard |
| Cream/Tinted | Sussex, Faverolles | White/salmon plumage, feathered legs |

### Notes
Free-form text field for any additional LLM observations not captured by structured fields.
