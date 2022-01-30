import React, {useEffect, useState} from 'react';
import _, { result } from 'lodash';

function App() {
  const [queryResultData, setQueryResultData] = useState();
  const [departments, setDepartments] = useState({});
  const [departmentFilter, setDepartmentFilter] = useState("*");
  const [artistFilter, setArtistFilter] = useState("");
  const [mediumFilter, setMediumFilter] = useState("");
  const [textFilter, setTextFilter] = useState("");
  const [loadingFilters, setLoadingFilters] = useState(true);//loading status for the filters, right now its just dept data
  const [loadingQuery, setLoadingQuery] = useState(true);//loading status for the main search query
  const [loadingQueryText, setLoadingQueryText] = useState("...");

  useEffect(() => {
    fetchDepartmentData();
  }, [])

  const fetchDepartmentData = async() => {
    let fetchUrl = `/api-departments`
    setLoadingFilters(true);
    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const results = await response.json();
    if(results.success) {
      //console.log("department data: ", results.data);
      setDepartments(results.data.departments);
    }
    setLoadingFilters(false);
  }

  const fetchQuery = async() => {
    let fetchUrl = `/api-query?dept=${departmentFilter}&artist=${artistFilter}&medium=${mediumFilter}&text=${textFilter}`;//pass in all our filters
    setLoadingQueryText("Loading ...");
    setLoadingQuery(true);

    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const results = await response.json();
    if(results.success) {
      console.log("Query results data: ", results.data);
      if(results.data != false){
        
        setQueryResultData(results.data);
        setLoadingQuery(false);
      } else {
        setQueryResultData({});
        setLoadingQueryText("No Results Found")
        setLoadingQuery(true);
      }
    }
  }

  const preSubmitValidation = () => {
    if(textFilter.length < 1){
      alert("You must enter something in the search bar first!");
      return false;
    }
    fetchQuery();
  }

  const departmentFilterUpdate = (event) => {
    setDepartmentFilter(event.target.value);
  }

  const artistFilterUpdate = (event) => {
    setArtistFilter(event.target.value);
  }

  const mediumFilterUpdate = (event) => {
    setMediumFilter(event.target.value);
  }

  const textFilterUpdate = (event) => {
    setTextFilter(event.target.value);
  }

  

  return (
    <div className="App">
      {loadingFilters ? <div>Loading Filter Data...</div> :
      <div className="formFilter">
        <div>
        <div>
          <label>
            Search Term:
            <input name="Text Filter" type="text" value={textFilter} onChange={textFilterUpdate}></input>
          </label>
        </div>
          <label>
            Department Filter: 
          <select value={departmentFilter} onChange={departmentFilterUpdate}>
            <option value="*">All Departments</option>
            {_.map(departments, function(department) {
              return (<option value={department.departmentId}>{department.displayName}</option>)
              })
            }
          </select>
          </label>
        </div>
        <div>
          <label>
            Artist Filter: 
            <input name="Artist Filter" type="text" value={artistFilter} onChange={artistFilterUpdate}></input>
          </label>
        </div>
        <div>
          <label>
            Medium Filter:
            <input name="Medium Filter" type="text" value={mediumFilter} onChange={mediumFilterUpdate}></input>
          </label>
        </div>
        <div>
          <button onClick={preSubmitValidation}> Search!</button>
        </div>
        <div>
          {loadingQuery ? <div>{loadingQueryText}</div> :<div>
            <table>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Medium</th>
                <th>Author</th>
                <th>department</th>
              </tr>
              {_.map(queryResultData, function(artpeice){
                return(
                  <tr>
                    <td>
                      <img src={artpeice.primaryImageSmall} alt={artpeice.title}/>
                    </td>
                    <td>
                      <b>{artpeice.title}</b>
                    </td>
                    <td>
                      <b>{artpeice.medium}</b>
                    </td>
                    <td>
                      by: {artpeice.artistDisplayName == "" ? "Unknown": artpeice.artistDisplayName}
                    </td>
                    <td>
                      <b>{artpeice.department}</b>
                    </td>
                  </tr>
                )
              })}
            </table>
          </div>}
        </div>
      </div>
      }
    </div>
  );
}


export default App;
