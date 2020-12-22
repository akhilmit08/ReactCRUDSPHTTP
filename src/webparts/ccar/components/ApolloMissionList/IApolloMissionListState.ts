import { IMissionListItem } from "../../../../models";

export interface IApolloMissionListState {
  filteredMissions: IMissionListItem[];
  showAllMissions: boolean;
}
