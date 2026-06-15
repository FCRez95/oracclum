export type MetaClickStepStatus = 0 | 1 | 2;

export interface MetaClickStepsModel {
  id: number;
  id_click: string;
  id_campaign: number;
  id_campaign_meta: string | number;
  id_ad_set: string | number;
  id_ad_meta: string | number;
  step_1: MetaClickStepStatus;
  step_2: MetaClickStepStatus;
  step_3: MetaClickStepStatus;
  checkout: MetaClickStepStatus;
  revenue: number;
  payment_type: string | null;
  id_order: string | number | null;
}
