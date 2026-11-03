# Try the camera fixes before publishing

This is a local test build of Bone Lab. Opening it does not upload anything to GitHub or publish the website.

## Open the test app on Windows

1. Right-click `Bone-Lab-Test.zip` and choose **Extract All**.
2. Open the extracted `Bone-Lab-Test` folder.
3. Double-click **Start-Bone-Lab.bat**.
4. The launcher opens Bone Lab in your browser at `http://127.0.0.1:8000/`. Keep the command window open while testing.

The launcher uses an existing Python 3 or Node.js installation. It does not install either program or any packages. If neither is installed, it displays a message instead of starting the app. You can use the official [Python](https://www.python.org/downloads/) or [Node.js](https://nodejs.org/en/download) installer, then run the launcher again.

On macOS or Linux, open a terminal in the extracted folder and run `python3 start-local.py` or `node start-local.mjs`.

Use the launcher rather than opening `dist/index.html` directly: browser security rules prevent the model and modules from loading correctly from a file address.

## What changed

- Selecting a bone or landmark keeps your rotation, zoom, and pan.
- **Focus** centers the selected structure and adjusts its size on screen while preserving your current viewing angle. It no longer automatically isolates the bone.
- **Use suggested angle** is an explicit action in the detail card for when you want the recommended anatomical view.
- Standard view buttons rotate around your current target while keeping the zoom level.
- **Isolate**, **Fade others**, and side-selection controls preserve the camera view.
- Returning to Explore restores its view, including skull opening, pelvic separation, and visibility settings.
- Mouse dragging, right-clicking, and multi-touch gestures no longer count as selecting a new bone.
- The angle indicator changes to **Custom** when you rotate manually. **Reset** and the R shortcut use the same reset behavior, including correctly closing the skull.
- Selecting another structure keeps your list scroll position and chosen left/right side. Clicking a particular left/right bone in the model selects that side.
- Dark mode remains included and remembers your preference.

If a newly selected structure is outside the current view, press **Focus** to bring it into view. Selection itself now leaves the camera in place.

## Suggested checks

1. Rotate the full skeleton to an unusual angle, zoom in, and pan. Select several visible bones directly on the model. The view should stay in place.
2. From the same view, select bones and small markings from the list. Click left/right side buttons. Rotation, pan, and zoom should remain unchanged.
3. Click **Focus**. The selected structure should come to the center without flipping to the front. Click **Use suggested angle** only when you want a recommended angle.
4. Open **Practice**, then return to **Explore**. Repeat with **Compare** and **My progress**. Your Explore view should return.
5. Drag the model and finish near where you began. It should rotate without accidentally selecting another bone. Test right-drag panning as well.
6. Open the skull, then use **Reset** or R. The full skeleton should return to the anterior view and **Open skull** should become inactive.
7. Try a few practice questions and check dark/light mode. In a quiz, Focus is disabled to avoid revealing a find-the-structure target.

## Verification completed

The bundled camera tests passed using the app's actual Three.js geometry and OrbitControls: selection, focus, presets, drag inertia, view restoration, reset routing, and click/drag handling. The existing 104-term data and answer-grading checks also passed. The browser check confirmed the updated controls and structure-selection interface.

The available test browser has WebGL disabled, so actual 3D rendering could not be visually verified there. Testing the model on your own WebGL-capable browser remains necessary before deployment.

Optional developer checks, with Node.js 22.15 or newer: `node verify-camera.mjs` and `node verify.mjs`.

Your progress on the old live website is separate from this local address. Use **Save progress** on the old app and **My progress → Import progress** here if you want your existing study history. Export again after testing if you want to move that history to a future GitHub Pages version.
