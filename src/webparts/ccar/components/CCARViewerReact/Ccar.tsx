import * as React from 'react';
import styles from './Ccar.module.scss';
import { ISPHttpClientOptions, SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { escape } from '@microsoft/sp-lodash-subset';
import { 
  ApolloMissionList,
  ICcarProps,
  ICcarState
} from '../';
import { IMissionListItem } from '../../../../models';
import { MissionService } from '../../../../services';

export class Ccar extends React.Component<ICcarProps, ICcarState> {

  private missionService: MissionService;
  constructor(props: ICcarProps){
    super(props);

    // init the state to empty
    this.state = {
      missions: []
    };
    
    // because our event handler needs access to the component, bind 
    //  the component to the function so it can get access to the
    //  components properties (this.props)... otherwise "this" is undefined
    this._removeMission = this._removeMission.bind(this); 
  }

  protected onInit(): Promise<void> {
    this.missionService = new MissionService(this.context.pageContext.web.absoluteUrl, this.context.spHttpClient);

    return Promise.resolve();
  }

  private _getListItems(): Promise<IMissionListItem[]> {
    const url: string = this.props.siteUrl + "/_api/web/lists/getbytitle('Apollo Missions')/items";
    return this.props.context.spHttpClient.get(url,SPHttpClient.configurations.v1)
    .then(response => {
    return response.json();
    })
    .then(json => {
    return json.value;
    }) as Promise<IMissionListItem[]>;
    }

  

    public bindDetailsList() : void {

      this._getListItems().then(listItems => {
        this.setState({ missions: listItems});
      });
    }
  
  
    public componentDidMount(): void {
    
      this.bindDetailsList();

    }

  public render(): React.ReactElement<ICcarProps> {
    return (
      <div className={ styles.ccar }>
        <div className={ styles.container }>
          <div className={ styles.row }>
            <div className={ styles.column }>
              <span className={ styles.title }>Welcome to SharePoint!</span>
              <p className={ styles.subTitle }>Customize SharePoint experiences using Web Parts.</p>
              <ApolloMissionList missions = {this.state.missions}
               onDeleteMission={ this._removeMission }/>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Removes the specified mission from the state. This triggers an update to rendering.
   * 
   * @private
   * @param {IMission} missionToRemove 
   * @memberof ApolloViewerReact
   */
  private _removeMission(missionToRemove: any): void {
   // const newMissions: IMissionListItem[] = this.state.missions.filter(mission => mission !== missionToRemove);

  //  this.setState({ missions: newMissions });

  let id: number = missionToRemove;

    console.log(id);

    const url: string = this.props.siteUrl + "/_api/web/lists/getbytitle('Apollo Missions')/items(" + id + ")";          

    
    const headers: any = { "X-HTTP-Method": "DELETE", "IF-MATCH": "*" };

    const spHttpClientOptions: ISPHttpClientOptions = {
      "headers": headers
    };


    this.props.context.spHttpClient.post(url, SPHttpClient.configurations.v1, spHttpClientOptions)
    .then((response: SPHttpClientResponse) => {
      if (response.status === 204) {
        alert("record got deleted successfully....");
        this.bindDetailsList();   
        
      } else {
        let errormessage: string = "An error has occured i.e.  " + response.status + " - " + response.statusText;
        //this.setState({status: errormessage}); 
      }
    });
  }
}
