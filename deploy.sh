npm run build
cp -R build/ ../nyufbdashboardapi/static
# aws s3 --region us-east-2 rm s3://pol-ads-dashboard
# aws s3 --region us-east-2 sync build/ s3://pol-ads-dashboard
