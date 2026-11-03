# Bone Lab for BIOL 270

An exam-focused browser app with an interactive anatomical skeleton, 104 study cards, identification practice, side identification, comparisons, and local progress.

## Run on your device

1. Extract the downloaded ZIP into a folder.
2. With Python 3 installed, open a terminal in that folder and run `python -m http.server 8000 --directory dist`. On macOS or Linux, use `python3` in place of `python`.
3. Open `http://localhost:8000` in Chrome, Edge, Firefox, or Safari.

On Windows, `Start-Bone-Lab.bat` starts a local server and opens the app using an existing Python 3 or Node.js installation. Leave its terminal window open while studying and follow its instructions to stop the server. On other platforms, `python3 start-local.py` or `node start-local.mjs` does the same.

Opening index.html directly with a file:// URL will not work because browsers restrict local module and data loading. There is no build step, npm installation, API key, or app account to configure. All runtime scripts, models, and reference files are included. After extraction, the local app works without internet access; external source links need internet access.

## What is included

- 104 distinct exam concepts: 46 axial and 58 appendicular.
- 32 whole-bone or anatomical-region model groups.
- 56 landmark concepts with pins transferred from the original Z-Anatomy anatomical label pointers.
- 16 reference-only items with related-bone context, complete study cards, and lab PDF links.
- Explore, name the structure, find the structure, left/right, vertebra identification, timed practical, missed-structure review, and study-card recall.
- A downloadable coverage table inside the app.
- Progress export/import. Confidence is self-rated and stored separately from measured quiz accuracy.
- Dark mode with softer 3D lighting. Use the Light mode / Dark mode button in the top bar to switch; your choice is remembered on this device. New sessions without a saved choice start in dark mode.

## Exact 3D coverage limits

The following 16 terms do not have an admitted 3D marking target and are excluded from scored 3D identification questions:

Sagittal suture; coronal suture; lambdoid suture; squamous suture; zygomatic process of temporal bone; zygomatic arch; mandibular fossa; external auditory meatus; carotid canal; jugular foramen; internal auditory/acoustic meatus; cribriform plate; coronoid process of mandible; sacroiliac joints; pubic symphysis; pubic arch.

These items are available in text recall. Their 3D views show associated bones only. They still need source-defined landmarks or segmented regions, with checked alignment, before adding them to 3D quizzes.

Ilium, ischium, and pubis have anatomical pins but remain part of the fused adult hip-bone mesh; they cannot be isolated as separately segmented surfaces. The pelvis can be separated into the two hip bones, sacrum, and coccyx.

Pins identify points rather than outlining an entire marking. Find-the-structure grading uses a small neighborhood around each source pin, with a 2.5–9 mm world-space tolerance according to parent-bone size. The model view is automatically aimed along the original label leader direction. A pin can be visible through a bone when the view is rotated; use the surrounding geometry and the source reference to interpret it.

## Data and sources

Model attribution required by the source:

- "BodyParts3D - The Database Center for Life Science - CC-BY-SA 2.1 Japan"
- "Z-Anatomy - The open source atlas of anatomy - CC-BY-SA 4.0"

The skeletal.glb export comes from https://github.com/nqwrc/3d-anatomy (commit 8ca3b7421bcfbe88b85859eb1983d5cf79f21749). Bone meshes are unchanged; display colors and UI labels are adapted. Original license and attribution notices are included in `dist/assets/`.

Landmark leader endpoints come from the SkeletalSystem100.fbx source in https://github.com/Z-Anatomy-Community/Z-Anatomy (tree 6c7f9016bd5899ac8edafd31b9900c151df42ed6). Original pointer tips are converted from the source bone’s local Z-up coordinates to the glTF bone’s local Y-up coordinates. Parent bone bounds are compared before a point is admitted; the tolerance is 0.15 mm in local coordinates. Original bone instance transforms preserve position and side. A pin is reused on the opposite side only where the glTF uses the identical shared mesh.

The supplied class PDFs and DOCX are included for personal study and retain their original ownership. Third-party model and software notices retain their respective licenses. Three.js r180 uses the MIT license; the Google Draco decoder uses Apache 2.0.

## Controls

- Drag: rotate. Scroll/pinch: zoom. Right-drag or two-finger gesture: pan.
- Focus the viewer and use arrow keys to rotate, +/− to zoom, R to reset.
- `/`: focus the structure search. Escape: close a dialog.
- Explore provides isolate, fade others, labels, standard views, open skull, and pelvic separation controls.
- Selecting a structure preserves the camera. Focus centers it while retaining the viewing angle; Use suggested angle explicitly changes the angle. Standard-view buttons preserve the target and zoom. Returning to Explore restores its last view.

## Files

- `dist/index.html`, `dist/styles.css`: interface and responsive layout.
- `dist/theme.js`: theme preference, early theme application, and the theme button.
- `dist/app.mjs`: study workflows, quizzes, local progress, and coverage.
- `dist/viewer.mjs`: anatomical 3D rendering, camera, label pins, and picking.
- `dist/core.mjs`: answer normalization, grading, and progress validation.
- `dist/data/`: study content, model mapping, coverage, and research notes.
- `dist/assets/`: skeleton, source documents, and model notices.
- `dist/vendor/`: locally bundled Three.js and Draco.
- `verify.mjs`: data integrity, anatomy-name disambiguation, and progress-import checks. Run with Node 22 or later: `node verify.mjs`.
- `verify-camera.mjs`: camera and pointer-gesture regression checks using bundled Three.js and OrbitControls. Run with Node 22.15 or later.
- `TEST-BEFORE-DEPLOYING.md`, `start-local.py`, `start-local.mjs`, and `Start-Bone-Lab.bat`: local testing instructions and launchers.
- `.github/workflows/deploy-pages.yml`: GitHub Pages publication workflow.
- `GITHUB-PAGES-SETUP.md`: upload, publishing, and troubleshooting instructions.
- `package-github.py`: refreshes `dist/Bone-Lab-Source.zip` and creates `exports/Bone-Lab-GitHub.zip` using Python 3.

