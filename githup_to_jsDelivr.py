def convert_github_link(github_url):
    if "blob/main" in github_url:
        cdn_url = github_url.replace("github.com", "cdn.jsdelivr.net/gh").replace("blob/main", "@main")
        print("Direct video URL:", cdn_url)
    else:
        print("Invalid GitHub URL format. Make sure it contains 'blob/main'.")

# Ask for user input
github_url = input("Enter the GitHub video URL: ")
convert_github_link(github_url)
