<script>
    export let addText;
    let text = "";
  
    const addAndClear = () => {
      addText(text);
      text = "";
    };
  </script>
  
  <input bind:value={text} /><button on:click={addAndClear}>Add text</button>
