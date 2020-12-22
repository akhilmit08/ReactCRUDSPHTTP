import * as React from 'react';
import styles from '../CCARViewerReact/Ccar.module.scss';
import { List } from 'office-ui-fabric-react/lib/List';
import { TagPicker } from 'office-ui-fabric-react/lib/components/pickers/TagPicker/TagPicker';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';

import { IMissionListItem } from '../../../../models';

import { ApolloMission } from '../ApolloMission';
import { 
  IApolloMissionListProps,
  IApolloMissionListState
} from './';

export class ApolloMissionList extends React.Component<IApolloMissionListProps, IApolloMissionListState> {

  constructor(props: IApolloMissionListProps) {
    super(props);

    this.state = {
      filteredMissions: [],
      showAllMissions: false
    };
  }

  public render(): React.ReactElement<IApolloMissionListProps> {

    return (
      <div>
         <Toggle 
          label='Show all or filtered missions?'
          onText='showing all missions'
          offText='showing selected missions'
          checked={ this.state.showAllMissions }
          onChanged={ this.onPickerToggleChanged }
        />
         <TagPicker onResolveSuggestions={ this._onFilterChanged }
         pickerSuggestionsProps={
          {
            suggestionsHeaderText: 'Suggested Apollo missions...',
            noResultsFoundText: 'No matching Apollo missions found'
          }
        }
        onChange={ this._onSelectedItemsChanged }
         />
          <List
          items={ this._missionsToShow }
          onRenderCell={ this._onRenderCell }
        />
        
      </div>
    );
    
  }

  private get _missionsToShow(): IMissionListItem[] {
    return this.state.showAllMissions 
      ? this.props.missions
      : this.state.filteredMissions;
  }

  private _onSelectedItemsChanged = (items: any[]): void => {
    const filteredMissions: any[] = items.map(item => item.mission);

    this.setState((prevState: IApolloMissionListState) => {
      const newState: IApolloMissionListState = {
        showAllMissions: prevState.showAllMissions,
        filteredMissions: filteredMissions
      };
      return newState;
    });
  }

  private onPickerToggleChanged = (checked: boolean): void => {
    this.setState({ showAllMissions: checked });
  }

  private _onRenderCell = (mission: IMissionListItem, index: number | undefined): JSX.Element => {
    return (
      <ApolloMission 
                     mission={ mission }
                     onRemoveMission={ this.props.onDeleteMission } />
    );
  }

  private _onFilterChanged = (filterText: string, tagList: { key: string, name: string, mission: IMissionListItem }[]): { key: string, name: string, mission: IMissionListItem }[] => {
    // get list of all matching missions with the same ID / mission name
    const filteredMissions: IMissionListItem[] = this.props.missions.filter(mission => {
      if (
          (mission.Title.toLowerCase().indexOf(filterText.toLowerCase()) === 0) 
        ){
          return mission;
        }
    });

    // return as an array of keys & names
    return filteredMissions.map(mission => ({ 
      key: this._getMissionUniqueId(mission),
      name: `(${ mission.Id }) ${ mission.Title }`,
      mission: mission
    }));
  }
  /**
   * Generate a unique ID for the element to help React uniquely identify each element.
   * 
   * @private
   * @param {IMission} mission    The mission to generate the unique ID for.
   * @returns {string}            Unique ID for the mission.
   * @memberof ApolloMissionList
   */
  private _getMissionUniqueId(mission: IMissionListItem): string {
    return (`${ mission.Id }|${ mission.Title.replace(' ','_') }`).toLowerCase();
  }

}