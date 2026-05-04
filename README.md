# node-modules-template-bug

Reproduces the Endor Labs partial-scan failure caused by Python `requirements.txt`
files bundled inside `aws-cdk` init templates under `node_modules/`.

## What's going on

`aws-cdk` ships project init templates so users can run `cdk init` to scaffold
new CDK apps. The templates live at:

```
node_modules/aws-cdk/lib/init-templates/<flavor>/python/requirements.txt
node_modules/@aws-cdk/asset-awscli-v1/layer/requirements.txt
```

These template files contain placeholder syntax like `aws-cdk-lib%cdk-version%`
that `cdk init` substitutes at scaffold time. They are NOT valid PEP 508 and
were never meant to be installed.

Endor's dependency scanner walks the workspace after `npm install` and
discovers every supported manifest type, including these `requirements.txt`
files. The Python resolver chokes on the placeholder syntax, which flips the
scan to partial-success.

## Reproduce

```bash
git init
git add .
git commit -m "init"

npm install

# Confirm the bundled requirements.txt files now exist:
find node_modules -name requirements.txt -exec echo "=== {} ===" \; -exec cat {} \;

# Run an Endor scan and observe partial scan results / Python resolution errors:
endorctl scan --namespace <your-namespace>
```

Expected output of the `find` step includes lines like:

```
aws-cdk-lib%cdk-version%
constructs%constructs-version%
awscli==1.44.68
urll=2.6.3,<3.0.0
pyasn1>=0.6.3
```

## Fix

Add `**/node_modules/**` to the project's scan profile **Exclude Paths**.
This stops the dependency scanner from descending into `node_modules` looking
for non-npm manifests. The npm scan itself reads `package.json` /
`package-lock.json`, so excluding `node_modules` does not affect npm
dependency resolution.

If the project has similar issues with vendored Python or Go deps, mirror
with `**/vendor/**`, `**/.venv/**`, `**/site-packages/**`.
