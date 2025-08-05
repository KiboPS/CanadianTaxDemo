
import { platformApplicationsInstallImplementation } from "./platformInstall";
import { estimateTaxes } from "./taxController";
import { ThrirdPartyTaxableOrder, ThrirdPartyOrderTaxContext } from '@kibocommerce/rest-sdk/clients/PricingStorefront/models'
import { validateTotalsMatch } from "./utils";

/**
 * Modify this list if you need more actions
 */
export enum ActionId {
  "http.commerce.catalog.storefront.tax.estimateTaxes.before",
  "embedded.platform.applications.install",
}

export type EstimateTaxContext = {
  request: {
    body: ThrirdPartyTaxableOrder,
  },
  response: {
    body: ThrirdPartyOrderTaxContext,
  },
  exec: Record<string, never>
  configuration: any
}

export interface ArcFunction {
  actionName: string;
  customFunction: (
    context: any,
    callback: (errorMessage?: string) => void
  ) => void;
}

export function createArcFunction(
  actionName: ActionId,
  customFunction: (
    context: any,
    callback: (errorMessage?: string) => void
  ) => void
): ArcFunction {
  return { actionName: ActionId[actionName], customFunction: customFunction };
}

const taxBeforeAction = createArcFunction(
  ActionId["http.commerce.catalog.storefront.tax.estimateTaxes.before"],
  function (context: EstimateTaxContext, callback: (errorMessage?: string) => void) {

    try {
      estimateTaxes(context).then((resp: ThrirdPartyOrderTaxContext) => {
        validateTotalsMatch(resp)
        context.response.body = resp
        callback();
      }).catch((err: any) => {
        console.error("Error executing estimateTaxes:", err)
        callback(err)
      })
    } catch (err: any) {
      console.error("Error executing estimateTaxes:", err)
      callback(err)
    }
  }
);

const platformApplicationsInstall = createArcFunction(
  ActionId["embedded.platform.applications.install"],
  function (context: any, callback: (errorMessage?: string) => void) {
    console.log("ts installing");
    platformApplicationsInstallImplementation(context, callback).then(() => {
      callback()
    })
  }
);

export default {
  "http.commerce.catalog.storefront.tax.estimateTaxes.before": taxBeforeAction,
  "embedded.platform.applications.install": platformApplicationsInstall,
}