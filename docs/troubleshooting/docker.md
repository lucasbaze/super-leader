Sometimes supabase gets stuck and starts draining battery life like crazy.

I've found that deleting all the containers, volumes, and images and then reinstalling docker fixes it.

```bash
docker rm -f $(docker ps -aq)
docker rmi -f $(docker images -q)
docker volume rm -f $(docker volume ls -q)
```
