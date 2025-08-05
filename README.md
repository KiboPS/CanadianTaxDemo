# Canadian Tax API Extensions Starter Kit

This is a demo showing a simplified Canadian tax integration in Kibo.

## Getting Started

The starter kit contains a Canadian tax implementation that calculates provincial taxes (GST, PST, HST, QST) based on the shipping province. The implementation uses configurable tax rates that can be customized per province. You can use this as a starting point to add your own tax implementation that either calls out to a tax service or adds custom VAT logic. See [Developer Tools](https://docs.kibocommerce.com/help/developer-tools) in the Kibo documentation for information on getting started with applications.

You will need to first upload the code to a new application, modify the code to your needs, install, and then test.

## Install

First install the dependencies with: `npm install`

Then create a `mozu.config.json`


```json
{
  "baseUrl": "https://home.mozu.com",
  "developerAccountId": 0,
  "developerAccount": {
    "emailAddress": "email@example.com"
  },
  "workingApplicationKey": "Namespace.AppKey.1.0.0.Release"
}
```

Then build with `grunt`. It will run through eslint and Typescript checks, compile the code into the assets folder, and then upload to your application using mozusync as usual.

Example Configuration:

```
{
	"actions": [
		{
			"actionId": "http.commerce.catalog.storefront.tax.estimateTaxes.before",
			"contexts": [
				{
					"customFunctions": [
						{
							"applicationKey": "kibops.CanadianTaxDemo.1.0.0.Release",
							"functionId": "http.commerce.catalog.storefront.tax.estimateTaxes.before",
							"enabled": true,
							"configuration": {
								"AB": {
									"rate": "0.05",
									"type": "GST"
								},
								"BC": {
									"rate": "0.12",
									"type": "GST+PST"
								},
								"MB": {
									"rate": "0.12",
									"type": "GST+PST"
								},
								"NB": {
									"rate": "0.15",
									"type": "HST"
								},
								"NL": {
									"rate": "0.15",
									"type": "HST"
								},
								"NT": {
									"rate": "0.05",
									"type": "GST"
								},
								"NS": {
									"rate": "0.15",
									"type": "HST"
								},
								"NU": {
									"rate": "0.05",
									"type": "GST"
								},
								"ON": {
									"rate": "0.13",
									"type": "HST"
								},
								"PE": {
									"rate": "0.15",
									"type": "HST"
								},
								"QC": {
									"rate": "0.14975",
									"type": "GST+QST"
								},
								"SK": {
									"rate": "0.11",
									"type": "GST+PST"
								},
								"YT": {
									"rate": "0.05",
									"type": "GST"
								}
							}
						}
					]
				}
			]
		}
	],
	"configurations": [],
	"defaultLogLevel": "Info"
}
```

## Development

First, go to `src/taxController.ts` and you can modify the base implementation from there. Note the helper functions in `src/utils.ts` which you can use to distribute totals onto line items and fix rounding issues.

Then, create a new order in the Kibo Admin interface and add some items. You will see tax in the order line items. Then you can use the API, e.g. GET `{{baseUrl}}/commerce/orders/16ef50de03bcc000010abb6e00009af4`, to verify that the `itemTaxTotal` and `shippingTaxTotal` looks correct.

