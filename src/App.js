import React, {useEffect, useState} from 'react';

function App() {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(  () => {
    async function fetchData() {
      setLoading(true);
      const response = await fetch('/api');
      const results = await response.json();
      if(results.success) {
          setData(results.data);
      }
      setLoading(false);
    }
    fetchData();
  }, [])

  return (
    <div className="App">
      {loading ? <div>Loading...</div> : data}
      {/*Insert UI elements and components here*/}
    </div>
  );
}

export default App;
