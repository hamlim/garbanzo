import mri from "mri";
import { CLI } from ".";

let parsedArgs = mri(process.argv.slice(2));

let cli = new CLI(parsedArgs);

cli.run().catch((error) => {
  console.error(error);
  process.exit(1);
});
