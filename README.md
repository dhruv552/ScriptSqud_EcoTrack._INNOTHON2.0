# Ecostrack - Carbon Footprint Tracking Application

Ecostrack is a personal carbon footprint tracking application that helps users monitor and reduce their environmental impact. The application provides data visualization, AI-powered recommendations, and historical tracking of carbon emissions.

## API Setup Required

This application requires two API keys to function properly:

### 1. Carbon Interface API
To get a Carbon Interface API Key:
1. Visit [Carbon Interface](https://www.carboninterface.com/) and create an account
2. Once logged in, go to your Dashboard
3. Generate an API key
4. Open `src/lib/apiKeys.ts` in this project
5. Replace `YOUR_CARBON_INTERFACE_API_KEY` with your actual API key

### 2. Google Gemini API
To get a Google Gemini API Key:
1. Visit [Google AI Studio](https://ai.google.dev/)
2. Create or log in to your Google account
3. Navigate to the [API keys section](https://ai.google.dev/tutorials/setup) 
4. Create a new API key
5. Open `src/lib/apiKeys.ts` in this project
6. Replace `AIzaSyDTH5tqVzJQQtbqpHLKfXkV3CZCKc_tYKw` with your actual API key

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
