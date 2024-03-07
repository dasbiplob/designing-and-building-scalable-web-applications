<script>
    const fetchJoke = async () => {
      const response = await fetch('https://simple-joke-api.deno.dev/random');
      return await response.json();
    };
  
    let jokePromise = fetchJoke();
  
    const updateJoke = () => {
      jokePromise = fetchJoke();
    };
  </script>
  
  <button on:click={updateJoke}>Fetch a joke</button>
  
  {#await jokePromise}
    <p>Loading...</p>
  {:then joke}
    <p>Setup: {joke.setup}</p>
    <p>Punchline: {joke.punchline}</p>
  {/await}
