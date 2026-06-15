export const pickAllowed = <T extends Record<string, unknown>>(data: Record<string, unknown>, allowedFields: string[]) => {
  return allowedFields.reduce((result, field) => {
    if (data[field] !== undefined) {
      result[field] = data[field];
    }

    return result;
  }, {} as Record<string, unknown>) as T;
};
