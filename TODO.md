# TODO: Update Webhook URLs

## Tasks

- [x] Search for old webhook URL `9021079c-3f5b-476a-a2fc-5db4ed4f7a9f` in all files
- [x] Update webhook URL in `src/app/exams/exams-client.tsx` if needed (currently has new URL)
- [x] Check for any other files containing the old webhook URL
- [x] Delete `.next` folder to rebuild and remove cached old URLs
- [x] Restart server to ensure updates take effect
- [ ] Test webhook functionality with new URL

## Notes

- New webhook URL: `https://mostafa-tata50.app.n8n.cloud/webhook-test/b9e11ef6-5a5b-4cbb-9fd0-46c6574d4ac9`
- Old webhook URL: `https://mostafa-tata50.app.n8n.cloud/webhook-test/9021079c-3f5b-476a-a2fc-5db4ed4f7a9f`
- Found old URL in compiled `.next` files, rebuilt successfully
- No old URLs found in source files, only in TODO.md and previously in .next (now removed)
- Server restarted successfully on http://localhost:3000
