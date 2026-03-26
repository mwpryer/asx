import { InputError, hint, removeAccount } from "@mwp13/asx-core";
import { buildCommand } from "@stricli/core";

import { asxFunc } from "@/command";
import type { AsxCliContext } from "@/context";

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
  func: asxFunc(async function (
    this: AsxCliContext,
    _flags: {},
    alias: string,
  ) {
    if (!removeAccount(alias)) {
      throw new InputError("INPUT_INVALID", `Account "${alias}" not found`);
    }
    hint(`Account "${alias}" removed`);
  }),
});
