<script>
    let items = ['A', 'B', 'C'];
    let count = 0;
    const increment = () => {
      count++;
    };
  </script>
  
  {#if count == 42}
    <p>You've found the meaning of life!</p>
  {/if}
  
  {#if count == 0}
    <p>Press the button!</p>
  {:else if count > 0 && count <= 10}
    <p>That's the way!</p>
  {:else}
    <p>Enough!</p>
  {/if}
  
  <button on:click={increment}>{count}</button>
  
  <p>And, here's the list</p>
  
  <ul>
    {#each items as item}
      <li>{item}</li>
    {/each}
  </ul>
