# Actions

A collection of GitHub actions.

## ESLint

Offload your CI for running ESLint. With this action you can run it in parallel to your CI process, which means, faster builds!

This action will also annotate the diff with the errors and warnings reported by ESLint.

How to use it?

In the visual editor, enter `gimenete/actions/eslint@master` as the path to the action and check the `GITHUB_TOKEN` secret.

If you want to use the file editor, add something like this:

```
workflow "Title of your workflow" {
  on = "push"
  resolves = ["ESLint"]
}

action "ESLint" {
  uses = "gimenete/actions/eslint@master"
  secrets = ["GITHUB_TOKEN"]
}
```
