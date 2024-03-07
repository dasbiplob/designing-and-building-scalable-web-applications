<script>
    let numbers = [];
    let inputNumber = "";
  
    const addValue = () => {
      const newNumber = parseFloat(inputNumber);
      if (!isNaN(newNumber)) {
        numbers = [...numbers, newNumber];
        inputNumber = ""; // Clear the input field after adding a number
      }
    };
  
    $: sum = numbers.reduce((acc, num) => acc + num, 0);
    $: totalNumbers = numbers.length;
    $: average = totalNumbers > 0 ? sum / totalNumbers : 0;
  </script>
  
  <h1>Statistics generator</h1>
  
  <input bind:value={inputNumber} type="number" />
  <button on:click={addValue}>Add value</button>
  
  <h2>Statistics</h2>
  
  <p>Sum: {sum}</p>
  <p>Total numbers: {totalNumbers}</p>
  <p>Average: {average.toFixed(2)}</p>
  
  <h2>Numbers entered so far</h2>
  
  <ul>
    {#each numbers as number}
      <li>{number}</li>
    {/each}
  </ul>
  