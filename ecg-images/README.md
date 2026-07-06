# ECG Quiz Images

Drop your ECG image files in this folder (e.g. `001.jpg`, `002.png`).

Then add one entry per image to the `ECG_QUIZ_BANK` array near the top of the
JS in `index.html` (search for `ECG_QUIZ_BANK`):

```js
{ file: 'ecg-images/001.jpg', diagnosis: 'Atrial Fibrillation',
  explanation: 'Irregularly irregular rhythm, absent P waves.' }
```

- `file` — path to the image, relative to index.html (so `ecg-images/yourfile.jpg`)
- `diagnosis` — the answer shown when "Reveal Diagnosis" is tapped
- `explanation` — optional one-liner on the key finding(s)

The dashboard picks one entry per calendar day (same one all day, a new one
the next day) and shows it on Medicine → ECG Quiz. Remember to drag the whole
`training-dashboard` folder (including this one) onto Netlify when you redeploy.
