<script>
  let count = 0;
  let mult = count * 2;
  const increment = () => {
    count++;
    mult = count * 2;
  };
</script>

<button on:click={increment}>{count}</button>
<p>Multiplied {count} * 2 = {mult}</p>
