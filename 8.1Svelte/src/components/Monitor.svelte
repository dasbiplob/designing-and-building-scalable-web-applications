<script>
    import Editor from "./Editor.svelte";
    let texts = [];
    const addText = (text) => {
      texts = [...texts, text];
    };
  </script>
  
  <Editor {addText} />
  
  <ul>
    {#each texts as text}
      <li>{text}</li>
    {/each}
  </ul>
