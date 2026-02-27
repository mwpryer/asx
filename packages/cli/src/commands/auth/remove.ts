import { buildCommand } from "@stricli/core";
import { InputError, logger, removeAccount } from "@mwp13/asx-core";
import type { AsxCliContext } from "../../context.js";

export const removeCommand = buildCommand({
  docs: { brief: "Remove a stored account" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        {
          brief: "Account alias to remove",
          placeholder: "alias",
          parse: String,
        },
      ],
    },
    flags: {},
  },
  func: async function (this: AsxCliContext, _flags: {}, alias: string) {
    if (!removeAccount(alias)) {
      throw new InputError("INPUT_INVALID", `Account "${alias}" not found`);
    }
    logger.hint(`Account "${alias}" removed`);
  },
});
