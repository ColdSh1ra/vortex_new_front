## Localized content and workshop page

Site content lives in `server/data/vortex.json`, under `ua`, `cz`, `sk`, `en`, and `pl`.
Each locale has the same structure. `ui` contains interface labels and messages, and
`car_service` contains the six workshop page blocks. Add text to every locale;
`useI18n().t(key, values)` supports `{name}` interpolation and Ukrainian fallback.
The public locale codes `ua` and `cz` map to HTML/reCAPTCHA language tags `uk` and `cs`.

The header selector updates all sections without resetting the pricing calculator.
Selection persists in `vortex-language` localStorage and a same-named cookie, which
also controls the initial server render. Workshop styles are in
`src/styles/car-service.css` and load on `/car-service`, including SSR.

Trial requests include `source_page` (`home`, `contact`, or `car-service`) and
`language`. Both are validated by the API and included in Telegram notifications.
A configured `VITE_RECAPTCHA_SITE_KEY`, server reCAPTCHA secret, and Telegram bot
are required for real delivery.

The supplied design contains document names, but no PDF files or URLs. Fill in
`car_service.blocks[1].documents[].href` in each locale to enable downloads.
Until then, document names are shown as plain text.

Validation: `npm run build` from the repository root; `npm --prefix server test`.

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

## Website development page

`/websites` uses `src/styles/websites.css`. The page layout and package configuration
are in `src/pages/WebsiteDevelopmentPage.tsx` and `src/data/websitePlans.ts`.
New service labels and page captions live in `src/locales/{ua,cz,sk,en,pl}.json`;
the existing introductory copy is reused from the homepage content.

Add the following images to `client/public/imgs/websites` to replace the white placeholders:

- `overview.png`: the introductory preview.
- `example-free.png`: the free template preview.
- `example-practical.png`: the Practical template preview.
- `example-maximum.png`: the Maximum template preview.

The same filenames also support `.jpg`, `.jpeg`, `.webp`, and `.avif` extensions.
Images are discovered during Vite development/build, so rebuild after adding them
for production. Use one image format per filename.

Choosing a package scrolls to the form and includes `website_package` and the
`websites` source in the request and Telegram notification.
