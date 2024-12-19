let base_url = "https://datafeed-api-aaron.atelli.ai";

window.onload = (event) => {
  const fileUpload = document.getElementById("file-upload");
  const urlFile = document.getElementById("url-upload");
  const file = document.getElementById("file");
  const url = document.getElementById("url");

  fileUpload.addEventListener("click", () => {
    file.disabled = false;
    url.disabled = true;
    url.value = "";
  });

  urlFile.addEventListener("click", () => {
    file.disabled = true;
    url.disabled = false;
    file.value = "";
  });

  let client_url = `${base_url}/client`;

  fetch(client_url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((result) => {
      const client = document.getElementById("client");
      result["_data"].forEach((clientName) => {
        const option = document.createElement("option");
        option.value = clientName.id;
        option.text = clientName.label;
        client.appendChild(option);
      });
    })
    .catch((error) => console.log("error", error));
};

function collectAndSendData() {
  const fileUpload = document.getElementById("file-upload");
  const urlUpload = document.getElementById("url-upload");
  const file = document.getElementById("file");
  const url = document.getElementById("url");

  if (fileUpload.checked) {
    uploadFile();
  } else if (urlUpload.checked) {
    uploadUrl();
  }
}

function uploadFile() {
  const client = document.getElementById("client").value;
  const file = document.getElementById("file").files[0];
  let file_url = `${base_url}/file/upload/${client}`;

  const formData = new FormData();
  formData.append("file", file);

  console.log(file);

  let startTime = performance.now();
  let endTime;
  const upload = fetch(file_url, {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error();
      }
      alert("Success");
    })
    .catch((error) => alert("Error"));
}

function uploadUrl() {
  const client = document.getElementById("client").value;
  const url = document.getElementById("url").value;
  let file_url = `${base_url}/file/upload/${client}`;

  const upload = fetch(file_url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url: url }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error();
      }
      alert("Success");
    })
    .catch((error) => alert("Error"));
}
