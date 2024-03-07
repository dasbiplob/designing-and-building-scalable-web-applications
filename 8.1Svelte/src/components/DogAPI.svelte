<script>
    let fact = "";
    const fetchFact = () => {
      fetch("https://dogapi.dog/api/v2/facts")
        .then((response) => response.json())
        .then((jsonData) => {
          fact = jsonData.data[0].attributes.body;
        });
    };
  </script>
  
  <button on:click={fetchFact}>Fetch a dog fact</button>
  
  <p>{fact}</p>
