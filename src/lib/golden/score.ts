export interface GoldenPrediction {
  trulyUnsupported: boolean;
  predictedUnsupported: boolean;
}

export interface GoldenScore {
  precision: number;
  recall: number;
  f1: number;
  tp: number;
  fp: number;
  fn: number;
  tn: number;
}

export function scoreGolden(predictions: GoldenPrediction[]): GoldenScore {
  let tp = 0,
    fp = 0,
    fn = 0,
    tn = 0;
  for (const p of predictions) {
    if (p.predictedUnsupported && p.trulyUnsupported) tp++;
    else if (p.predictedUnsupported && !p.trulyUnsupported) fp++;
    else if (!p.predictedUnsupported && p.trulyUnsupported) fn++;
    else tn++;
  }
  const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
  const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
  const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
  return { precision, recall, f1, tp, fp, fn, tn };
}
