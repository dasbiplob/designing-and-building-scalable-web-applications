<script>
    export let addTask;
    let task = '';
    const taskTyped = () => {
      if (task.length === 0) {
        return;
      }
  
      //alert(task);
      addTask(task);
      task = '';
    }
  </script>
  
  <section>
    <p>Provide task name</p>
    <input bind:value={task} />
    <button on:click={taskTyped}>Add task</button>
  </section>
  
  <style>
    section {
      padding: 0.5rem;
      margin: 0.5rem;
      font-family: 'Comic Sans MS';
    }
  </style>
