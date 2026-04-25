import { z } from "zod";

export const notificationSchema = z.object({
  emailNotification: z.boolean(),
  appNotification: z.boolean(),
});