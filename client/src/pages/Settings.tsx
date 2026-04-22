import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Settings() {
  const [, setLocation] = useLocation();
  const settingsQuery = trpc.settings.get.useQuery();
  const updateSettingsMutation = trpc.settings.update.useMutation({
    onSuccess: () => {
      toast.success("설정이 저장되었습니다.");
      settingsQuery.refetch();
    },
    onError: (error) => {
      toast.error("설정 저장에 실패했습니다.");
    },
  });

  const [slackWebhookUrl, setSlackWebhookUrl] = useState("");
  const [googleClientId, setGoogleClientId] = useState("");
  const [googleClientSecret, setGoogleClientSecret] = useState("");
  const [slackReportEnabled, setSlackReportEnabled] = useState(true);

  useEffect(() => {
    if (settingsQuery.data) {
      setSlackWebhookUrl(settingsQuery.data.slackWebhookUrl || "");
      setSlackReportEnabled(settingsQuery.data.slackReportEnabled === 1);
    }
  }, [settingsQuery.data]);

  const handleSaveSettings = async () => {
    await updateSettingsMutation.mutateAsync({
      slackWebhookUrl: slackWebhookUrl || undefined,
      slackReportEnabled: slackReportEnabled ? 1 : 0,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/dashboard")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">설정</h1>
            <p className="text-slate-600 mt-1">Slack 및 구글 캘린더 설정</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Slack Settings */}
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
              <CardTitle className="text-slate-900">Slack 설정</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div>
                <Label htmlFor="slack-webhook" className="text-slate-700 font-semibold">
                  Webhook URL
                </Label>
                <p className="text-sm text-slate-600 mt-1 mb-3">
                  매일 오후 5시에 업무 리포트를 보낼 Slack 채널의 Webhook URL을 입력하세요.
                </p>
                <Input
                  id="slack-webhook"
                  type="password"
                  placeholder="https://hooks.slack.com/services/..."
                  value={slackWebhookUrl}
                  onChange={(e) => setSlackWebhookUrl(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="slack-enabled"
                  checked={slackReportEnabled}
                  onChange={(e) => setSlackReportEnabled(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <Label htmlFor="slack-enabled" className="text-slate-700 cursor-pointer">
                  매일 오후 5시에 자동으로 업무 리포트 발송
                </Label>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>💡 팁:</strong> Slack Webhook URL은 비공개 채널에 설정하는 것을 권장합니다.
                  <br />
                  <a
                    href="https://api.slack.com/apps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Slack API 페이지에서 Webhook URL을 생성할 수 있습니다.
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Google Calendar Settings */}
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
              <CardTitle className="text-slate-900">구글 캘린더 설정</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-900">
                  <strong>⚠️ 준비 중:</strong> 구글 캘린더 OAuth 연동 기능은 현재 개발 중입니다.
                  <br />
                  <a
                    href="https://console.cloud.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-600 hover:underline"
                  >
                    Google Cloud Console에서 OAuth 크레덴셜을 생성할 수 있습니다.
                  </a>
                </p>
              </div>

              <div>
                <Label className="text-slate-700 font-semibold">
                  클라이언트 ID (준비 중)
                </Label>
                <Input
                  type="password"
                  placeholder="xxx.apps.googleusercontent.com"
                  disabled
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-slate-700 font-semibold">
                  클라이언트 보안 비밀번호 (준비 중)
                </Label>
                <Input
                  type="password"
                  placeholder="••••••••••••••••••••"
                  disabled
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setLocation("/dashboard")}
            >
              취소
            </Button>
            <Button
              onClick={handleSaveSettings}
              disabled={updateSettingsMutation.isPending}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              저장
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
