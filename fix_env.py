import re

with open('.github/workflows/deploy-jmd-online-book.yml', 'r') as f:
    content = f.read()

# We need to make sure the amondnet/vercel-action has the correct project id and org id because Vercel returns: Error! Project not found ({"VERCEL_PROJECT_ID":"***","VERCEL_ORG_ID":"***"})
# Wait, maybe they are empty. Let's see if there is another way to deploy to vercel or if we need to remove the deploy-jmd-online-book.yml file because there is a deploy.yml
