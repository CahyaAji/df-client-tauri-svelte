<script>
  import { API_URL } from "../utils/apihandler.js";
</script>

<div
  style="border-bottom: 2px solid white;background-color: #222222; color: white;"
>
  <div>Status</div>
  <iframe
    src={`${API_URL}/config`}
    title="Example website"
    style="width: 100%; height: 100%; border: none;"
  ></iframe>
</div>
