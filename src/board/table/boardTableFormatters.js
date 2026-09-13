import { createTableFormatters } from "./tableFormatters";
import { isDeathEventLabel } from "../model/eventRows";

export const createBoardTableFormatters = (config) => createTableFormatters({
  actionType: config.actionType,
  getColorNameDictionary: config.getColorNameDictionary,
  getPlayerIsIcon: config.getPlayerIsIcon,
  isDeathEventLabel,
  reviveImage: config.reviveImage,
  roleImage: config.roleImage,
  roletype: config.roletype,
});
