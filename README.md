

# Political Ad Dashboard

This repo is meant to house the dashboard for accessing data from Quartz's political ad database, which is itself a combination of data from The Globe & Mail's Facebook Political Ad Tracker (see https://fbads.theglobeandmail.com/facebook-ads/admin) and a database originally created by NYU but now maintained by Quartz.

The dashboard is a React-based client-side app designed to facilitate access to the combined database. The backend/API has been created by Jeremy Merrill, and lives on a Rails app at http://dashboard.qz.ai/ .

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Running and deploying the app.

Dev: Install dependencies with `npm install` and run with `npm start`.

Deploy: Run `npm build`. This will output all the files required for deployment in the `/build` folder. Then move the build/ folder to the nyufbdashboardapi folder `npm run build && cp -R build/ ../nyufbdashboardapi/static` and deploy with `eb deploy` from there.

## App overview

The Political Ad Dashboard runs fundamentally off the URL route & params; it searches and filters in response to changes to params and should search correctly when linking urls with full params. As the route & params change, `react-router-dom`'s `BrowserRouter` listens to and broadcasts changes to the path across the app. Broadcasted changes are then parsed within either the `AdSearch` or `Advertiser` components, which then triggers a search.

In order to change URL params, the most efficient way is to wrap a component in the `withURLParams` higher-order component and use the `setParam`/`toggleParam` methods.

# Create React App Documentation

### Available Scripts

In the project directory, you can run:

#### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

#### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

#### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

#### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

