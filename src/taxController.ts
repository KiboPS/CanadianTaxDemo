import { EstimateTaxContext } from "./main";
import { ThrirdPartyOrderTaxContext } from '@kibocommerce/rest-sdk/clients/PricingStorefront/models'
import { createBlankResponse, spreadTotalsOntoLineItems } from "./utils";

const DEFAULT_TAX_RATES = {
  "AB": {"rate": "0.05", "type": "GST"},
  "BC": {"rate": "0.12", "type": "GST+PST"},
  "MB": {"rate": "0.12", "type": "GST+PST"},
  "NB": {"rate": "0.15", "type": "HST"},
  "NL": {"rate": "0.15", "type": "HST"},
  "NT": {"rate": "0.05", "type": "GST"},
  "NS": {"rate": "0.15", "type": "HST"},
  "NU": {"rate": "0.05", "type": "GST"},
  "ON": {"rate": "0.13", "type": "HST"},
  "PE": {"rate": "0.15", "type": "HST"},
  "QC": {"rate": "0.14975", "type": "GST+QST"},
  "SK": {"rate": "0.11", "type": "GST+PST"},
  "YT": {"rate": "0.05", "type": "GST"},
}

/**
 * Calculate tax breakdown based on province tax type
 */
const calculateTaxBreakdown = (totalAmount: number, province: string, taxInfo: any) => {
  const taxType = taxInfo?.type || "HST"
  const taxRate = Number(taxInfo?.rate || "0.13")
  const totalTax = totalAmount * taxRate
  
  let gst = 0
  let pst = 0
  let hst = 0
  let qst = 0
  
  switch(taxType) {
    case "HST":
      hst = totalTax
      break
    case "GST":
      gst = totalTax
      break
    case "GST+PST":
      // GST is 5%, remainder is PST
      gst = totalAmount * 0.05
      pst = totalTax - gst
      break
    case "GST+QST":
      // GST is 5%, QST is 9.975%
      gst = totalAmount * 0.05
      qst = totalAmount * 0.09975
      break
  }
  
  return {
    gst: Number(gst.toFixed(2)),
    pst: Number(pst.toFixed(2)),
    hst: Number(hst.toFixed(2)),
    qst: Number(qst.toFixed(2))
  }
}

/**
 * Main entrance point to implement your tax logic
 * 
 * @param context API Extension Context
 * @returns ThrirdPartyOrderTaxContext
 */
export const estimateTaxes = async (context: EstimateTaxContext): Promise<ThrirdPartyOrderTaxContext> => {
  const request = context.request.body
  let resp = createBlankResponse(context.request.body)

  // Use configured tax rates if available, otherwise use default rates
  const taxRates = context.configuration?.tax_rates || DEFAULT_TAX_RATES
  
  // Get province from shipping address (defaulting to ON if not found)
  const province = request.taxContext?.destinationAddress?.stateOrProvince || "ON"
  
  // Get tax rate for the province
  const provinceTaxInfo = taxRates[province] || taxRates["ON"]
  const taxRate = provinceTaxInfo?.rate || 0.13

  // Calculate total amount
  const totalAmount = request.lineItems
    ?.map(l => l.lineItemPrice || 0)
    .reduce((partialSum: number, a) => partialSum + a, 0) || 0

  // Calculate tax based on provincial rate
  resp.orderTax = totalAmount * taxRate

  // Calculate tax breakdown
  const taxBreakdown = calculateTaxBreakdown(totalAmount, province, provinceTaxInfo) as any
  
  // Add tax breakdown to taxData
  (resp as any).taxData = {
    province: province,
    taxType: provinceTaxInfo?.type || "HST",
    gst: String(taxBreakdown.gst.toFixed(2)),
    pst: String(taxBreakdown.pst.toFixed(2)),
    hst: String(taxBreakdown.hst.toFixed(2)),
    qst: String(taxBreakdown.qst.toFixed(2)),
    totalTax: String(resp.orderTax.toFixed(2))
  }

  resp = spreadTotalsOntoLineItems(request, resp)
  
  return resp
}

