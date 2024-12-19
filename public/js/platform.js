let base_url = "https://datafeed-api-aaron.atelli.ai";

let url = `${base_url}/platform`;

function collectAndSendData(divId) {
  const div = document.getElementById(divId);
  const inputs = div.querySelectorAll("input");
  const name = document.querySelector("#name");
  const label = document.querySelector("#label");
  const data = {};

  inputs.forEach((input) => {
    data[input.id] = input.value;
  });

  const jsonStructure = {
    name: name.value,
    label: label.value,
    data: JSON.stringify(data),
  };

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(jsonStructure),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error();
      }
      alert("Success");
    })
    .catch((error) => alert("Error"));
}
