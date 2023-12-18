# Autocomplete

This is a direct copy of Trevor Eyre's [`Autocomplete`](https://autocomplete.trevoreyre.com/) component ([github](https://github.com/trevoreyre/autocomplete))

I've got this because I need a couple of features that the original `Autocomplete` does not yet support (although I have created a [pull request](https://github.com/trevoreyre/autocomplete/pull/166)). If my pull request is accepted, I'll switch to using the [npm version](https://www.npmjs.com/package/@trevoreyre/autocomplete-vue).

In this version, Autocomplete emits two extra events: `isvalid` and `matchcount` which together allow for validation suitable TSF's needs

When the original `Autocomplete` component is ready, re-add it with:

```sh
npm install --save @trevoreyre/autocomplete-vue
```
