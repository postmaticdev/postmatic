import axios, { AxiosError } from "axios";
import { BACKEND_URL } from "../constant";

const url = BACKEND_URL + "/";

async function spam() {
  let success = 0;
  let err = 0;
  for (let i = 0; i < 1000; i++) {
    try {
      await axios.get(url);
      console.log(i);
      success++;
    } catch (error) {
      console.log(
        "error in ",
        i,
        error instanceof AxiosError
          ? error.response?.data?.metaData || "unknown"
          : "unknown"
      );
      err++;
    }
  }
  console.log("total success", success);
  console.log("total error", err);
}

spam();
