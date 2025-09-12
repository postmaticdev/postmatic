export class BaseUtils {
  protected log(action: string, data?: any) {
    console.log(`[UTILS LOG]: ${action}`, data ?? "");
  }

  protected handleError(context: string, err: unknown) {
    console.error(`[ERROR in ${context}]`, err);
    throw new Error(
      err instanceof Error ? err.message : "Unexpected utils error"
    );
  }
}
